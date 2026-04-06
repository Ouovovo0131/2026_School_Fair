import { QUESTS } from "../../constants/quests";

export const THEME_NAMES: Record<number, string> = Object.fromEntries(
  QUESTS.map((quest) => [quest.id, quest.title])
);

export const TASK_IMAGES: Record<number, string[]> = Object.fromEntries(
  QUESTS.filter(
    (quest) => quest.type === "photo"
  ).map((quest) => {
    const id = quest.id;
    if (id === 1) {
      return [id, ["/tasks/tasks-1-1.png", "/tasks/tasks-1-2.png"]];
    }
    if (id === 7) {
      return [id, ["/tasks/tasks-7-1.png", "/tasks/tasks-7-2.png"]];
    }
    return [id, [`/tasks/tasks-${id}.png`]];
  })
);