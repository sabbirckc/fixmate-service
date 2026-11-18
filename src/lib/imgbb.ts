/**
 * How to Upload Images Using ImgBB in Next.js
 * Implementation following the guide specifications.
 */

export const uploadImage = async (imageFile: File): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_IMGBB_API_KEY is not configured");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${apiKey}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (data && data.success && data.data?.url) {
    return data.data.url;
  }

  throw new Error(data?.error?.message || "Image upload failed");
};

export const uploadImageToImgBB = uploadImage;

