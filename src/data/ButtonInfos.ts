import { AiOutlineMessage } from "react-icons/ai";
import { MdOutlineCall, MdWebStories } from "react-icons/md";
import { LuArchive, LuSettings } from "react-icons/lu";
import { IoIosStarOutline } from "react-icons/io";
import { LucidePhone } from "lucide-react";

export const buttonInfos = [
  {
    id: 1,
    icon: AiOutlineMessage,
    text: "Conversations",
  },
  { id: 2, icon: MdOutlineCall, text: "Calls" },
  { id: 3, icon: MdWebStories, text: "Story" },
  {
    id: 5,
    icon: IoIosStarOutline,
    text: "Starred messages",
  },
  {
    id: 4,
    icon: LuArchive,
    text: "Archived conversations",
  },
  { id: 6, icon: LuSettings, text: "Settings" },
  { id: 7, icon: LucidePhone, text: "Profile" },
];
