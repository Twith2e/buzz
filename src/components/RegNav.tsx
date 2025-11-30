import { useLocation, useNavigate } from "react-router-dom";

export default function RegNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const path = pathname.split("/");
  const currentPath = path[path.length - 1];

  const handleClick = () => {
    if (currentPath === "call") {
      navigate("/signup");
    } else {
      navigate("/call");
    }
  };

  return (
    <div className="justify-between flex items-center w-full px-3 mb-3">
      <div className="flex gap-2 align-middle">
        <button
          className={`${
            currentPath === ""
              ? "h-[10px] w-[25.7px] bg-[#fff]"
              : "h-[10px] w-[10px] bg-[#fafafa]"
          } rounded-full transition-all duration-300`}
        ></button>
        <button
          className={`${
            currentPath === "text"
              ? "h-[10px] w-[25.71px] bg-[#fff]"
              : "h-[10px] w-[10px] bg-[#fffcf299]"
          } rounded-full transition-all duration-300`}
        ></button>
        <button
          className={`${
            currentPath === "call"
              ? "h-[10px] w-[25.71px] bg-[#fff]"
              : "h-[10px] w-[10px] bg-[#fffcf299]"
          } rounded-full transition-all duration-300`}
        ></button>
      </div>
      <button
        onClick={handleClick}
        className="px-3 py-2 bg-white text-[#33BEE7] rounded transition-all duration-300"
      >
        {currentPath !== "call" ? "Skip" : "Get Started"}
      </button>
    </div>
  );
}
