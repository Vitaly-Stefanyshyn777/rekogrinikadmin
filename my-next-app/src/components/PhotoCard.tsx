import React from "react";
import { Photo } from "../../shared-types";
import { Trash2 } from "lucide-react";

interface PhotoCardProps {
  photo: Photo;
  onDelete: (photoId: string) => void;
  showTag?: boolean;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onDelete,
  showTag = true,
}) => {
  const getTagColor = (tag?: string) => {
    switch (tag) {
      case "before":
        return "bg-blue-100 text-blue-800";
      case "after":
        return "bg-green-100 text-green-800";
      case "general":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTagText = (tag?: string) => {
    switch (tag) {
      case "before":
        return "До";
      case "after":
        return "Після";
      case "general":
        return "Загальне";
      default:
        return "Без мітки";
    }
  };

  return (
    <div className="relative group">
      <img
        src={photo.url}
        alt={photo.title || "Фото"}
        className="aspect-square object-cover rounded-lg"
      />

      {/* Кнопка видалення */}
      <button
        onClick={() => onDelete(photo.id.toString())}
        className="absolute top-2 right-2 text-white p-2 bg-red-600 rounded-full hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg"
        title="Видалити фото"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Мітка фото */}
      {showTag && photo.tag && (
        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${getTagColor(
            photo.tag
          )}`}
        >
          {getTagText(photo.tag)}
        </div>
      )}

      {/* Назва фото */}
      {photo.title && (
        <p className="mt-2 text-sm text-gray-600 truncate">{photo.title}</p>
      )}
    </div>
  );
};

