import processIframe  from './processIframe.ts';
import { listen } from '../../src/utils/Messaging';
import { MessageType, Message } from '../../Types/Utils/Messages';

// @ts-ignore
export default defineBackground(() => {

  const removeProcessIframe = listen<void>((msg: Message<void>, sender) => {
    if (msg.type === MessageType.DOWNLOAD_PDF) {
      processIframe();
    }
  });

  return () => {
    removeProcessIframe();
  };
});
