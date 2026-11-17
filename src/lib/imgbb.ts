/**
 * ImgBB Image Upload Utility
 * Uploads an image file to ImgBB and returns the hosted URL.
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

  if (!apiKey) {
    console.warn("NEXT_PUBLIC_IMGBB_API_KEY is not defined. Using mock fallback preview.");
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || "Failed to upload image to ImgBB");
    }

    return result.data.url;
  } catch (error: any) {
    console.error("ImgBB upload error:", error);
    throw new Error(error.message || "Image upload failed");
  }
}
