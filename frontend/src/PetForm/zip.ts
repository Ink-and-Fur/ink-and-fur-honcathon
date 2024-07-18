import JSZip from 'jszip';


/**
 * Utility for creating a zip file from multiple `File`s
 */
export async function createZipFromFiles(files: File[]) {
  const zip = new JSZip()

  // biome-ignore lint/complexity/noForEach: <explanation>
  files.forEach((file) => {
    zip.file(file.name, file);
  });

  const zipFile = await zip.generateAsync({ type: "blob" })

  return zipFile;
}