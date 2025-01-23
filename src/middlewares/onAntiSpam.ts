import { general } from "../configuration/general";
import { IBotData } from "../interfaces/IBotData";

const userFilter = new Map();
const messageReceived = new Map();

export const isFiltered = (data: IBotData) => {
  // Se usuário não existe no filtro, criar entrada
  if (!userFilter.has(data.user)) {
    userFilter.set(data.user, {
      count: 1,
      timeoutId: setTimeout(() => {
        userFilter.delete(data.user);
        messageReceived.delete(data.user);
      }, general.TIMEOUT_IN_MILLISECONDS_BY_EVENT),
    });
    return false;
  }

  // Incrementa contador para usuário existente
  const filter = userFilter.get(data.user);
  filter.count += 1;

  // Verifica se atingiu limite e não recebeu aviso
  if (filter.count >= 2 && !messageReceived.has(data.user)) {
    data.sendWarningReply(
      `${data.nickName} está enviando mensagens muito rápido! Aguarde ${
        general.TIMEOUT_IN_MILLISECONDS_BY_EVENT / 1000
      } segundos para enviar novamente!`
    );
    messageReceived.set(data.user, true);
  }

  // Retorna true se passou do limite
  return filter.count >= 2;
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
