import { useReducer, useCallback, useState, useEffect } from 'react';
import { getAllFile, saveFile } from '../utils/StorageService';
import { fileToImageAttachment } from './useImageUploader';

export const useDrawer = () => {
  const [allAttachment, setAllAttachment] = useState<Attachment[]>([]);

  useEffect(() => {
    async function func() {
      const files = await getAllFile();
      const images = await Promise.all(
        files.map(async (file) => await fileToImageAttachment(file))
      );
      setAllAttachment(images);
    }
    func();
  }, []);

  return {
    allAttachment,
    setAllAttachment,
    save: async (newAttachment: ImageAttachment) =>
      await saveFile(newAttachment.file, newAttachment.id),
  };
};
