/**
 * ImgBB Image Upload Utility
 * Uploads an image file to ImgBB via official API v1 and returns the hosted URL.
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (!apiKey) {
    console.warn("NEXT_PUBLIC_IMGBB_API_KEY is not defined. Using local data preview fallback.");
    return convertFileToDataUrl(file);
  }

  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result && result.success && result.data) {
      return result.data.url || result.data.display_url;
    }

    console.warn("ImgBB API upload notice:", result?.error?.message || "Using preview fallback");
    return convertFileToDataUrl(file);
  } catch (error: any) {
    console.warn("ImgBB upload exception, using local image fallback:", error?.message || error);
    return convertFileToDataUrl(file);
  }
}

function convertFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
