import { Theme } from "@/utils/types";
import { ElementType } from "react";
import { useThemeContext } from "@/contexts/ThemeContext";
import api from "@/utils/api";

type OptionProps = {
  label: string;
  icon: ElementType;
  value: Theme;
  onClick?: () => void;
};

const Option = ({ label, icon: Icon, value, onClick }: OptionProps) => {
  const { theme, setTheme, setUpdatingSettings } = useThemeContext();

  const handleSelect = async () => {
    setUpdatingSettings(true);
    try {
      await api.patch("/settings", { theme: value });
      setTheme(value);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingSettings(false);
      onClick?.();
    }
  };

  const isActive = theme === value;

  return (
    <button
      onClick={handleSelect}
      className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
        isActive
          ? "ring-2 ring-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
          : ""
      }`}
      aria-pressed={isActive}
    >
      <Icon
        size={18}
        className={
          isActive ? "text-emerald-600" : "text-gray-600 dark:text-gray-300"
        }
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        {isActive && <span className="text-xs text-gray-500">Selected</span>}
      </div>
    </button>
  );
};

export default Option;
