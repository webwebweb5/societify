import {
  PiHouseLight,
  PiBellLight,
  PiUserLight,
  PiHouseFill,
  PiBellFill,
  PiUserFill,
} from "react-icons/pi";
import { NavLink } from "react-router-dom";
import { HiDotsHorizontal } from "react-icons/hi";
import SocietifySvg from "../svgs/societify";

const Sidebar = () => {
  const data = {
    fullName: "Phiri",
    username: "johndoe",
    profileImg: "/avatars/boy1.png",
  };

  return (
    <div className="md:flex-[2_2_0] max-w-[275px] px-2">
      <div className="sticky top-0 left-0 flex flex-col justify-between h-screen md:w-full">
        <div className="">
          <NavLink to="/" className="flex justify-center md:justify-start py-2">
            <SocietifySvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
          </NavLink>
          <ul className="flex flex-col gap-3 w-fit">
            <li className="flex justify-center md:justify-start">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex gap-4 items-center hover:bg-stone-900 transition-all rounded-full duration-400 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                    isActive ? "font-bold" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <PiHouseFill className="w-8 h-8" />
                    ) : (
                      <PiHouseLight className="w-8 h-8" />
                    )}
                    <span className="text-lg hidden md:block">Home</span>
                  </>
                )}
              </NavLink>
            </li>
            <li className="flex justify-center md:justify-start">
              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `flex gap-4 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                    isActive ? "font-bold" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <PiBellFill className="w-8 h-8" />
                    ) : (
                      <PiBellLight className="w-8 h-8" />
                    )}
                    <span className="text-lg hidden md:block">
                      Notification
                    </span>
                  </>
                )}
              </NavLink>
            </li>
            <li className="flex justify-center md:justify-start">
              <NavLink
                to={`/profile/${data?.username}`}
                className={({ isActive }) =>
                  `flex gap-4 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer ${
                    isActive ? "font-bold" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <PiUserFill className="w-8 h-8" />
                    ) : (
                      <PiUserLight className="w-8 h-8" />
                    )}
                    <span className="text-lg hidden md:block">Profile</span>
                  </>
                )}
              </NavLink>
            </li>
          </ul>
        </div>
        {data && (
          <NavLink
            to={`/profile/${data.username}`}
            className="my-3 flex md:gap-3 gap-0 items-start transition-all duration-300 hover:bg-[#181818] p-3 rounded-full"
          >
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
                <img src={data?.profileImg || "/avatar-placeholder.png"} />
              </div>
            </div>
            <div className="flex justify-between flex-1">
              <div className="hidden md:block">
                <p className="text-white font-bold text-sm w-20 truncate">
                  {data?.fullName}
                </p>
                <p className="text-slate-500 text-sm">@{data?.username}</p>
              </div>
            </div>
            <div className="flex justify-center items-center h-full">
              <HiDotsHorizontal className="w-5 h-5 cursor-pointer hidden md:block" />
            </div>
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
