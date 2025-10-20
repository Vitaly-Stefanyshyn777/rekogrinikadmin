import React from "react";
import { Photo } from "../../shared-types";
import { PhotoCard } from "./PhotoCard";

interface GroupedPhotosProps {
  photos: Photo[];
  onDeletePhoto: (photoId: string) => void;
  showTag?: boolean;
  groupBy?: "tag" | "pair";
}

export const GroupedPhotos: React.FC<GroupedPhotosProps> = ({
  photos,
  onDeletePhoto,
  showTag = true,
  groupBy = "tag",
}) => {
  // Групування фото за мітками
  const groupPhotosByTag = (photos: Photo[]) => {
    const groups: { [key: string]: Photo[] } = {
      before: [],
      after: [],
      general: [],
    };

    photos.forEach((photo) => {
      const tag = photo.tag || "general";
      if (groups[tag]) {
        groups[tag].push(photo);
      }
    });

    return groups;
  };

  // Групування фото за парами (3 "До" + 3 "Після")
  const groupPhotosByPairs = (photos: Photo[]) => {
    const beforePhotos = photos.filter((photo) => photo.tag === "before");
    const afterPhotos = photos.filter((photo) => photo.tag === "after");

    const pairs = [];
    const maxPairs = Math.min(
      Math.floor(beforePhotos.length / 3),
      Math.floor(afterPhotos.length / 3)
    );

    for (let i = 0; i < maxPairs; i++) {
      const beforeGroup = beforePhotos.slice(i * 3, (i + 1) * 3);
      const afterGroup = afterPhotos.slice(i * 3, (i + 1) * 3);

      if (beforeGroup.length === 3 && afterGroup.length === 3) {
        pairs.push({
          id: i + 1,
          before: beforeGroup,
          after: afterGroup,
        });
      }
    }

    return pairs;
  };

  // Групування: 3 ДО + 3 ПІСЛЯ + 3 ДО + 3 ПІСЛЯ...
  const groupPhotosBySequential = (photos: Photo[]) => {
    const beforePhotos = photos
      .filter((photo) => photo.tag === "before")
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    const afterPhotos = photos
      .filter((photo) => photo.tag === "after")
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    const groups = [];
    const maxPairs = Math.min(
      Math.floor(beforePhotos.length / 3),
      Math.floor(afterPhotos.length / 3)
    );

    // Створюємо пари: 3 ДО + 3 ПІСЛЯ
    for (let i = 0; i < maxPairs; i++) {
      const beforeGroup = beforePhotos.slice(i * 3, (i + 1) * 3);
      const afterGroup = afterPhotos.slice(i * 3, (i + 1) * 3);

      if (beforeGroup.length === 3 && afterGroup.length === 3) {
        // Додаємо групу "ДО"
        groups.push({
          id: `before-${i + 1}`,
          type: "before",
          photos: beforeGroup,
          title: `ДО ${i + 1}`,
        });

        // Додаємо групу "ПІСЛЯ"
        groups.push({
          id: `after-${i + 1}`,
          type: "after",
          photos: afterGroup,
          title: `ПІСЛЯ ${i + 1}`,
        });
      }
    }

    return groups;
  };

  const renderTagGroup = (tag: string, photos: Photo[], title: string) => {
    if (photos.length === 0) return null;

    const getTagColor = (tag: string) => {
      switch (tag) {
        case "before":
          return "bg-blue-50 border-blue-200";
        case "after":
          return "bg-green-50 border-green-200";
        case "general":
          return "bg-gray-50 border-gray-200";
        default:
          return "bg-gray-50 border-gray-200";
      }
    };

    const getTagText = (tag: string) => {
      switch (tag) {
        case "before":
          return "ДО";
        case "after":
          return "ПІСЛЯ";
        case "general":
          return "ЗАГАЛЬНІ";
        default:
          return "БЕЗ МІТКИ";
      }
    };

    return (
      <div key={tag} className="mb-8">
        {/* Заголовок групи */}
        <div className={`p-4 rounded-lg border-2 ${getTagColor(tag)} mb-4`}>
          <h3 className="text-lg font-bold text-center">
            {getTagText(tag)} ({photos.length} фото)
          </h3>
        </div>

        {/* Фото в групі */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onDelete={onDeletePhoto}
              showTag={showTag}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderPairGroup = (pair: any) => {
    return (
      <div key={pair.id} className="mb-12">
        {/* Заголовок пари */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">Пара {pair.id}</h3>
        </div>

        {/* Фото "До" */}
        {renderTagGroup("before", pair.before, "ДО")}

        {/* Розділювач */}
        <div className="flex items-center justify-center my-6">
          <div className="flex-1 border-t-2 border-gray-300"></div>
          <div className="px-4 text-gray-500 font-semibold">↓</div>
          <div className="flex-1 border-t-2 border-gray-300"></div>
        </div>

        {/* Фото "Після" */}
        {renderTagGroup("after", pair.after, "ПІСЛЯ")}
      </div>
    );
  };

  if (groupBy === "tag") {
    const groupedPhotos = groupPhotosByTag(photos);

    return (
      <div className="space-y-8">
        {renderTagGroup("before", groupedPhotos.before, "ДО")}
        {renderTagGroup("after", groupedPhotos.after, "ПІСЛЯ")}
        {renderTagGroup("general", groupedPhotos.general, "ЗАГАЛЬНІ")}
      </div>
    );
  }

  if (groupBy === "pair") {
    const sequentialGroups = groupPhotosBySequential(photos);

    return (
      <div className="space-y-8">
        {sequentialGroups.map((group) => (
          <div key={group.id} className="mb-8">
            {/* Заголовок групи */}
            <div
              className={`p-4 rounded-lg border-2 mb-4 ${
                group.type === "before"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              <h3 className="text-lg font-bold text-center">
                {group.title} ({group.photos.length} фото)
              </h3>
            </div>

            {/* Фото в групі */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onDelete={onDeletePhoto}
                  showTag={showTag}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Непарні фото */}
        {photos.filter((photo) => !photo.tag || photo.tag === "general")
          .length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Інші фото</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos
                .filter((photo) => !photo.tag || photo.tag === "general")
                .map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onDelete={onDeletePhoto}
                    showTag={showTag}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
