// TODO - Update client, this is an older version
import { load, Replicate } from "./deps.ts";

const env = await load();

// === Replicate prediction statuses === //
//
// starting: the prediction is starting up. If this status lasts longer than a few seconds, then it's typically because a new worker is being started to run the prediction.
export enum WebhookPredictionStatus {
  // webhook_events_filter.0 must be one of the following: \\\"start\\\", \\\"output\\\", \\\"logs\\\", \\\"completed\\\"

  START = 'start',
  OUTPUT = 'output',
  LOGS = 'logs',
  COMPLETED = 'completed',
}

// Export constants
export const PREDICTION_START = WebhookPredictionStatus.START;
export const PREDICTION_OUTPUT = WebhookPredictionStatus.OUTPUT;
export const PREDICTION_COMPLETED = WebhookPredictionStatus.COMPLETED;
export const PREDICTION_LOGS = WebhookPredictionStatus.LOGS;

type WebhookEvent = keyof typeof WebhookPredictionStatus

// @ts-ignore - there is a type bug in the Replicate export
export const replicate = new Replicate({
  auth: env.REPLICATE_API_TOKEN,
})

type TrainLoraInput = {
  /** Public URL (or temporary signed URL) to zip of images, hosted somewhere on the internets */
  inputImages: string
  /** Webhook URL to receive events about the progress of the training */
  webhook: string
  /** Events to filter */
  webhookEventsFilter: WebhookEvent[]
}

/**
 * Start a training job to produce LoRA weights for an SDXL model,
 * given a zip file with several images of someone's pet
 * 
 * Uses community model: zylim0702/sdxl-lora-customize-training:2ea90da29b19984472a0bbad4ecb39abe4b91fa0d6a5e8dc59988022149dee55
 *
 * @todo - Retry if failure?
 * 
 * @example
 * ```ts
 * const { data, error } = await trainLora({
 *   inputImages: 'https://example.com/images.zip',
 *   webhook: 'https://inkandfur.com/webhook',
 *   webhookEventsFilter: [PREDICTION_STARTING, PREDICTION_SUCCEEDED, PREDICTION_FAILED],
 * })
 * ```
 *
 */
export async function trainLora({ inputImages, webhook, webhookEventsFilter }: TrainLoraInput) {
  try {
    const output = await replicate.predictions.create({
      version: '2ea90da29b19984472a0bbad4ecb39abe4b91fa0d6a5e8dc59988022149dee55',
      input: {
        input_images: inputImages,
        // NOTE - The `token_string` param defaults to TOK (read more below)
        //        We could use this to specify the pet name, but DO NOT DO THAT FOR NOW
        //        as we haven't tested it, and it could confuse the base image model if it already has associations with that name.
        //        (e.g., if someone named their dog George Clooney, like my neighbor did) 
        // token_string: "TOK",
        //
        // NOTE - When training the LoRA weights, this model uses auto captioning.
        //        Each caption begins with "a photo of TOK"
        //        This is what teaches SDXL what the pet looks like
        //        the weights associate the pet with TOK
        // caption_prefix: `a photo of TOK, `
      },
      webhook,
      webhook_events_filter: webhookEventsFilter,
    })

    return { data: output, error: null, }
  } catch (error) {
    return {
      error,
      data: null
    }
  }
}

/**
 * URL to download the LoRA weights for a pet
 * Only valid for 1 hour before Replicate deletes it!
 */
type UrlToWeights = string;
type TrainLoraWebhookSuccessPayload = { status: WebhookPredictionStatus.COMPLETED, output: UrlToWeights }
export const handleTrainLoraWebhookSuccess = (webhookPayload: TrainLoraWebhookSuccessPayload) => {
  // TODO - Stream weights file to S3 asynchronously
  //        (do not block the webhook handler from returning while downloading the file, or you'll get lots of replays)
}

type CreateImageInputOptions = Partial<{
  negative_prompt?: string
  /** default: 1024 */
  width?: number
  /** default: 1024 */
  height?: number
  /** min 1, max 4 */
  num_outputs?: 1 | 2 | 3 | 4,
  /** default: no_refiner */
  refine?: "no_refiner" | "expert_ensemble_refiner" | "base_image_refiner",
  /** default: 50 */
  num_inference_steps?: number
  /** default: 0.8 */
  high_noise_frac?: number
  /** default: 0.6 */
  lora_scale?: number
}>

/**
 * Create an image of a pet based on lora weights
 * 
 * Uses community model: zylim0702/sdxl-lora-customize-model:5a2b1cff79a2cf60d2a498b424795a90e26b7a3992fbd13b340f73ff4942b81e
 * 
 * @todo - Retry if failure
 * 
 * @example
 * ```ts
 * const { data, error } = await createImageWithLoraWeights({
 *   loraUrl: 'https://example.com/lora.zip',
 *   prompt: 'a photo of TOK',
 *   webhook: 'https://inkandfur.com/webhook',
 *   webhookEventsFilter: [PREDICTION_STARTING, PREDICTION_SUCCEEDED, PREDICTION_FAILED],
 *   inputOptions: {
 *     negative_prompt: "frame, signature",
 *     lora_scale: 0.75,
 *   }
 * })
 * ```
 */
export async function createImageWithLoraWeights(
  /** HTTP URL to publicly hosted LoRA weights for a given pet */
  loraUrl: string,
  /** Prompt to generate an image with */
  prompt: string,
  /** Webhook URL (in our api) to receive events about the progress of the training */
  webhook: string,
  /** Webhook events we wish to receive */
  webhookEventsFilter: WebhookEvent[],
  /** Options for the prediction */
  inputOptions: CreateImageInputOptions = {},
) {
  try {
    const output = await replicate.predictions.create({
      version: '5a2b1cff79a2cf60d2a498b424795a90e26b7a3992fbd13b340f73ff4942b81e',
      input: {
        ...inputOptions,
        Lora_url: loraUrl,
        prompt,
      },
      webhook,
      webhook_events_filter: webhookEventsFilter,
    })

    return { data: output, error: null, }
  } catch (error) {
    return {
      error,
      data: null
    }
  }
}

type ImageUrl = string;
type CreateImageWebhookSuccessOutput = Array<ImageUrl>;
type CreateImageWebhookSuccessPayload = { status: WebhookPredictionStatus.COMPLETED, output: CreateImageWebhookSuccessOutput }
export const handleCreateImageWithLoraWeightsWebhookSuccess = (webhookPayload: CreateImageWebhookSuccessPayload) => {
  // TODO - Upload image files to S3 asynchronously
  //        (do not block the webhook handler from returning while uploading the files, or you'll get lots of replays)
}

/*
LOGS

{
  created_at: "2024-07-17T13:29:51.219Z",
  data_removed: false,
  error: null,
  id: "7x89a8mdedrgp0cgr3hahpf2vw",
  input: {
    input_images: "https://ink-and-fur-dev-eu.s3.eu-central-1.amazonaws.com/images_10_dog5.zip"
  },
  logs: "['./temp_in/20240514_123647.jpg', './temp_in/20240514_123706.jpg', './temp_in/20240514_124533.jpg', "... 167031 more characters,
  model: "zylim0702/sdxl-lora-customize-training",
  output: null,
  started_at: "2024-07-17T13:31:48.535688073Z",
  status: "processing",
  urls: {
    cancel: "https://api.replicate.com/v1/predictions/7x89a8mdedrgp0cgr3hahpf2vw/cancel",
    get: "https://api.replicate.com/v1/predictions/7x89a8mdedrgp0cgr3hahpf2vw"
  },
  version: "2ea90da29b19984472a0bbad4ecb39abe4b91fa0d6a5e8dc59988022149dee55",
  webhook: "https://tiny-bears-give.loca.lt/api/jobs/10/dog5/callback",
  webhook_events_filter: [ "start", "logs", "completed" ]
}

COMPLETE
{
  completed_at: "2024-07-17T13:39:05.570313299Z",
  created_at: "2024-07-17T13:29:51.219Z",
  data_removed: false,
  error: null,
  id: "7x89a8mdedrgp0cgr3hahpf2vw",
  input: {
    input_images: "https://ink-and-fur-dev-eu.s3.eu-central-1.amazonaws.com/images_10_dog5.zip"
  },
  logs: "['./temp_in/20240514_123647.jpg', './temp_in/20240514_123706.jpg', './temp_in/20240514_124533.jpg', "... 167286 more characters,
  metrics: { predict_time: 437.034625226 },
  model: "zylim0702/sdxl-lora-customize-training",
  output: "https://replicate.delivery/pbxt/BeDJZKzegzj9fJ3T1a3mNfiYx4wkWQJKYrYErMD555bX3eKZC/trained_model.tar",
  started_at: "2024-07-17T13:31:48.535688073Z",
  status: "succeeded",
  urls: {
    cancel: "https://api.replicate.com/v1/predictions/7x89a8mdedrgp0cgr3hahpf2vw/cancel",
    get: "https://api.replicate.com/v1/predictions/7x89a8mdedrgp0cgr3hahpf2vw"
  },
  version: "2ea90da29b19984472a0bbad4ecb39abe4b91fa0d6a5e8dc59988022149dee55",
  webhook: "https://tiny-bears-give.loca.lt/api/jobs/10/dog5/callback",
  webhook_events_filter: [ "start", "logs", "completed" ]
}


 */
