// Глобальний масив для зберігання завантажених фото
interface Photo {
  id: number;
  albumId: number;
  url: string;
  title: string;
  description: string;
  tag: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

const uploadedPhotos: Photo[] = [];

// Функція для додавання фото
export function addPhoto(photo: Photo) {
  uploadedPhotos.push(photo);
  console.log(`📸 Додано нове фото: ${photo.fileName} (ID: ${photo.id})`);
}

// Функція для отримання всіх фото
export function getAllPhotos() {
  return uploadedPhotos;
}

// Функція для видалення фото за ID
export function deletePhotoById(photoId: number) {
  const photoIndex = uploadedPhotos.findIndex((photo) => photo.id === photoId);
  if (photoIndex === -1) {
    return null;
  }
  return uploadedPhotos.splice(photoIndex, 1)[0];
}

// Функція для оновлення фото за ID
export function updatePhotoById(photoId: number, updates: Partial<Photo>) {
  const photoIndex = uploadedPhotos.findIndex((photo) => photo.id === photoId);
  if (photoIndex === -1) {
    return null;
  }

  uploadedPhotos[photoIndex] = {
    ...uploadedPhotos[photoIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return uploadedPhotos[photoIndex];
}
