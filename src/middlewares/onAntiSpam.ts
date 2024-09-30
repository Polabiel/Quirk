import { general } from "../configuration/general";
import { IBotData } from "../interfaces/IBotData";

const userFilter = new Map();

export const isFiltered = (data: IBotData) => {
  if (!userFilter.has(data.user)) {
    return false;
  }

  const { count, timeoutId } = userFilter.get(data.user);

  if (count === 2) {
    data.sendWarningReply(
      `${data.nickName} está enviando mensagens muito rápido! Aguarde ${
        general.TIMEOUT_IN_MILLISECONDS_BY_EVENT / 1000
      } segundos para enviar novamente!`
    );
  }

  return count >= 2 && timeoutId !== null;
};

export const addFilter = (sender: string) => {
  if (!userFilter.has(sender)) {
    userFilter.set(sender, { count: 0, timeoutId: null });
  }

  const { count, timeoutId } = userFilter.get(sender);
  if (count < 2) {
    userFilter.set(sender, { count: count + 1, timeoutId });

    if (count === 0) {
      const newTimeoutId = setTimeout(() => {
        userFilter.set(sender, { count: 0, timeoutId: null });
        if (userFilter.get(sender).count === 0) {
          userFilter.delete(sender);
        }
      }, general.TIMEOUT_IN_MILLISECONDS_BY_EVENT);

      userFilter.set(sender, { count: 1, timeoutId: newTimeoutId });
    }
  }
};
