import { Tab } from "@headlessui/react";
import { DynamicIcon } from 'lucide-react/dynamic';
export default function Tabs({
    tabs = [],
    orientation = "horizontal", // horizontal | vertical
    variant = "primary",
    fullWidth = false,
}) {
    const isVertical = orientation === "vertical";

    const variants = {
        primary: {
            list: "bg-gray-100",
            tab: "text-gray-600",
            active: "bg-white text-blue-600 shadow",
        },
        dark: {
            list: "bg-gray-800",
            tab: "text-gray-400",
            active: "bg-gray-600 text-white shadow",
        },
        success: {
            list: "bg-emerald-50",
            tab: "text-emerald-600",
            active: "bg-emerald-600 text-white shadow",
        },
        danger: {
            list: "bg-rose-50",
            tab: "text-rose-600",
            active: "bg-rose-600 text-white shadow",
        },
        premium: {
            list: "bg-white/5 backdrop-blur-md border border-white/5 p-2",
            tab: "text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all duration-300",
            active: "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10",
        },
    };

    const styles = variants[variant] || variants.primary;

    return (
        <Tab.Group vertical={isVertical}>
            <div
                className={`
                    flex gap-4
                    ${isVertical ? "flex-row" : "flex-col"}
                `}
            >
                {/* TAB LIST */}
                <Tab.List
                    className={`
                        flex rounded-xl p-1 ${styles.list}
                        ${isVertical ? "flex-col w-56 overflow-y-auto"
                            : "flex-row overflow-x-auto scrollbar-hide"
                        }
                        ${fullWidth && !isVertical ? "w-full" : ""}
                    `}
                >
                    {tabs?.map((tab, index) => (
                        <Tab
                            key={index}
                            className={({ selected }) =>
                                `
                                    relative whitespace-nowrap
                                    px-4 py-2 cursor-pointer 
                                    text-sm font-medium rounded-lg
                                    transition-all duration-200
                                    ${styles.tab}
                                    ${selected ? styles.active : ""}
                                    ${!isVertical && fullWidth ? "flex-1" : ""}
                                    focus:outline-none
                                `
                            }
                        >
                            <div className={'flex items-center gap-2'}>
                                {
                                    tab?.icon &&
                                    <DynamicIcon name={tab?.icon} size={18} />
                                }
                                <span>{tab.label}</span>
                            </div>
                        </Tab>
                    ))}
                </Tab.List>

                {/* PANELS */}
                <Tab.Panels className="flex-1">
                    {tabs?.map((tab, index) => (
                        <Tab.Panel
                            key={index}
                            className="rounded-xl p-4 shadow-sm 
                            focus:outline-none"
                        >
                            {tab.content}
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </div>
        </Tab.Group>
    );
}
