import downloadPdf  from './downloadPdf.ts';
import { listen } from '../../src/utils/Messaging';
import { MessageType, Message } from '../../Types/Utils/Messages';

// @ts-ignore
export default defineBackground(() => {

  const removeDownloadPdf = listen<void>((msg: Message<void>, sender) => {
    if (msg.type === MessageType.DOWNLOAD_PDF) {
      downloadPdf();
    }
  });

  return () => {
    removeDownloadPdf();
  };
});
