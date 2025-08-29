import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export function formatDate(isoString) {
  return formatDistanceToNow(new Date(isoString), {
    addSuffix: true,
    locale: ru,
  });
}
