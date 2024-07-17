// TODO - Update client, this is an older version
import Replicate from 'https://esm.sh/replicate@0.18.0'

const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')

// === Replicate prediction statuses === //
//
// starting: the prediction is starting up. If this status lasts longer than a few seconds, then it's typically because a new worker is being started to run the prediction.
export enum WebhookPredictionStatus {
  STARTING = 'starting',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

// Export constants
export const PREDICTION_STARTING = WebhookPredictionStatus.STARTING;
export const PREDICTION_PROCESSING = WebhookPredictionStatus.PROCESSING;
export const PREDICTION_SUCCEEDED = WebhookPredictionStatus.SUCCEEDED;
export const PREDICTION_FAILED = WebhookPredictionStatus.FAILED;
export const PREDICTION_CANCELED = WebhookPredictionStatus.CANCELED;

type WebhookEvent = keyof typeof WebhookPredictionStatus

// @ts-ignore - there is a type bug in the Replicate export
export const replicate = new Replicate({
  auth: REPLICATE_API_TOKEN,
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
 * @todo - Retry if failure
 * @todo - Handle errors
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
 * Run prediction based on lora weights
 * 
 * Uses community model: zylim0702/sdxl-lora-customize-model:5a2b1cff79a2cf60d2a498b424795a90e26b7a3992fbd13b340f73ff4942b81e
 */
export async function createImageWithLoraWeights(
  loraUrl: string,
  prompt: string,
  webhook: string,
  webhookEventsFilter: WebhookEvent[],
  inputOptions: CreateImageInputOptions = {},
) {
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

  return output
}
