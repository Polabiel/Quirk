import { general } from "../configuration/general";
import { IBotData } from "../interfaces/IBotData";
import { isJidGroup } from "baileys";

const isPrivilegedJid = (jid: string): boolean => {
  if (general.NUMBERS_HOSTS.includes(jid)) {
    return true;
  }

  if (isJidGroup(jid) && general.GROUP_SECURE.includes(jid)) {
    return true;
  }

  return false;
};

const userFilter = new Map();
const messageReceived = new Map();
const warningsSent = new Map();

export const isFiltered = (data: IBotData) => {
  if (isPrivilegedJid(data.remoteJid!)) return false;
  
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

  const filter = userFilter.get(data.user);
  filter.count += 1;

  if (filter.count >= 2 && !messageReceived.has(data.user)) {
    data.sendWarningReply(
      `${data.nickName} está enviando mensagens muito rápido! Aguarde ${
        general.TIMEOUT_IN_MILLISECONDS_BY_EVENT / 1000
      } segundos para enviar novamente!`
    );
    messageReceived.set(data.user, true);
  }

  return filter.count >= 2;
};

export const addFilter = (sender: string) => {
  if (isPrivilegedJid(sender)) return;
  
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

export const shouldIgnoreSpam = (jid: string): boolean => {
  if (isPrivilegedJid(jid)) return false;
  
  if (!userFilter.has(jid)) {
    userFilter.set(jid, {
      count: 1,
      timeoutId: setTimeout(() => {
        userFilter.delete(jid);
        messageReceived.delete(jid);
        warningsSent.delete(jid);
      }, general.TIMEOUT_IN_MILLISECONDS_BY_EVENT),
    });
    return false;
  }

  const filter = userFilter.get(jid);
  filter.count += 1;

  if (filter.count === 2) {
    return false;
  }

  return filter.count > 2;
};

export const addJidToFilter = (jid: string) => {
  if (isPrivilegedJid(jid)) return;
  
  if (!userFilter.has(jid)) {
    userFilter.set(jid, { count: 0, timeoutId: null });
  }

  const { count, timeoutId } = userFilter.get(jid);
  if (count < 2) {
    userFilter.set(jid, { count: count + 1, timeoutId });

    if (count === 0) {
      const newTimeoutId = setTimeout(() => {
        userFilter.set(jid, { count: 0, timeoutId: null });
        if (userFilter.get(jid).count === 0) {
          userFilter.delete(jid);
        }
      }, general.TIMEOUT_IN_MILLISECONDS_BY_EVENT);

      userFilter.set(jid, { count: 1, timeoutId: newTimeoutId });
    }
  }
};

export const shouldSendSpamWarning = (jid: string): boolean => {
  if (isPrivilegedJid(jid)) return false;
  
  if (!userFilter.has(jid)) return false;

  const filter = userFilter.get(jid);
  return filter.count === 2 && !warningsSent.has(jid);
};

export const markSpamWarningSent = (jid: string): void => {
  warningsSent.set(jid, true);
};

export const shouldIgnoreSpamHard = (jid: string): boolean => {
  if (isPrivilegedJid(jid)) return false;
  
  if (!userFilter.has(jid)) return false;

  const filter = userFilter.get(jid);
  return filter.count >= 2 && warningsSent.has(jid);
};
