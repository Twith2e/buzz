import { useState } from "react";
import SidebarButton from "./SidebarButton";
import { buttonInfos } from "@/data/ButtonInfos";
import { LucideMenu } from "lucide-react";

const Sidebar = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className={`border-r py-3 border-brandSky bg-background transition-[width, position] duration-700 ease-in-out overflow-hidden flex flex-col justify-between ${
        expanded
          ? "w-60 absolute left-0 bg-background h-screen top-0 z-10"
          : "w-14"
      }`}
    >
      <div>
        <button
          aria-label="collapse-and-expand-button"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? "Collapse" : "Expand"}
          className="flex justify-center items-center mb-4 px-3"
        >
          <LucideMenu size={25} />
        </button>

        {buttonInfos.slice(0, 2).map(({ id, icon, text }) => (
          <SidebarButton
            key={id}
            icon={icon}
            text={text}
            expanded={expanded}
            color="foreground"
            id={id}
          />
        ))}

        <div className="border-b-[#36454F] border my-3 w-[90%] m-auto"></div>
      </div>
      <div>
        {buttonInfos.slice(2).map(({ id, icon, text }, index) => (
          <div key={id}>
            {index === 1 ? (
              <>
                <SidebarButton
                  key={id}
                  icon={icon}
                  text={text}
                  expanded={expanded}
                  id={id}
                  color="gray"
                />
                <div className="border-b-[#36454F] border my-3 w-[90%] m-auto"></div>
              </>
            ) : (
              <SidebarButton
                key={id}
                id={id}
                icon={icon}
                text={text}
                expanded={expanded}
                color="gray"
              />
            )}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
