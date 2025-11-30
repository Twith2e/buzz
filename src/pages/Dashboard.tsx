import SidebarButton from "../components/SidebarButton";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { buttonInfos } from "../data/ButtonInfos";
import Chats from "../components/Chats";
import { HiOutlineMenu } from "react-icons/hi";
import { useState } from "react";
import ChatUI from "../components/ChatUI";

export default function Dashboard() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex h-screen">
      <aside
        className={`border-r py-3 border-brandSky bg-slate-200 transition-[width, position] duration-700 ease-in-out overflow-hidden flex flex-col justify-between ${
          expanded
            ? "w-60 absolute left-0 bg-slate-200 h-screen top-0 z-10"
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
            <HiOutlineMenu size={25} color="black" />
          </button>

          {buttonInfos.slice(0, 3).map(({ id, icon, text }) => (
            <SidebarButton
              key={id}
              icon={icon}
              text={text}
              expanded={expanded}
              color="gray"
              id={id}
            />
          ))}

          <div className="border-b-[#36454F] border my-3 w-[90%] m-auto"></div>
        </div>
        <div>
          {buttonInfos.slice(3).map(({ id, icon, text }, index) => (
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
      <PanelGroup className="grow" autoSaveId="example" direction="horizontal">
        <Panel maxSize={60} minSize={25}>
          <Chats />
        </Panel>
        <PanelResizeHandle className="border-[#36454F] border-3" />
        <Panel defaultSize={30} minSize={20} className="bg-white">
          <ChatUI />
        </Panel>
      </PanelGroup>
    </div>
  );
}
