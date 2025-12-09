import React, { createContext, useContext, useReducer, ReactNode } from "react";

/** Types - tweak screens & params to your app */
export type ScreenName = "conversations" | "chat" | "status" | "profile" | "settings";

export type ScreenParams = Record<string, any>; // narrow this for stronger typing

export type NavEntry = {
    name: ScreenName;
    params?: ScreenParams | null;
    // optional per-entry state (e.g., scroll position)
    state?: Record<string, any>;
};

type NavState = {
    stack: NavEntry[]; // bottom -> top, top is current
};

type NavAction =
    | { type: "PUSH"; entry: NavEntry }
    | { type: "REPLACE"; entry: NavEntry }
    | { type: "BACK"; steps?: number }
    | { type: "RESET"; entries: NavEntry[] }
    | { type: "UPDATE_TOP_STATE"; statePatch: Record<string, any> };

const initial: NavState = { stack: [{ name: "conversations", params: null }] };

function navReducer(state: NavState, action: NavAction): NavState {
    switch (action.type) {
        case "PUSH":
            return { stack: [...state.stack, action.entry] };
        case "REPLACE":
            return { stack: [...state.stack.slice(0, -1), action.entry] };
        case "BACK": {
            const steps = action.steps ?? 1;
            if (steps >= state.stack.length) return { stack: [state.stack[0]] }; // keep root
            return { stack: state.stack.slice(0, -steps) };
        }
        case "RESET":
            return { stack: action.entries.length ? action.entries : [initial.stack[0]] };
        case "UPDATE_TOP_STATE": {
            if (!state.stack.length) return state;
            const top = state.stack[state.stack.length - 1];
            const newTop = { ...top, state: { ...(top.state ?? {}), ...action.statePatch } };
            return { stack: [...state.stack.slice(0, -1), newTop] };
        }
        default:
            return state;
    }
}

type NavContextValue = {
    stack: NavEntry[];
    current: NavEntry;
    push: (name: ScreenName, params?: ScreenParams | null) => void;
    replace: (name: ScreenName, params?: ScreenParams | null) => void;
    back: (steps?: number) => void;
    reset: (entries: NavEntry[]) => void;
    updateTopState: (patch: Record<string, any>) => void;
};

const NavContext = createContext<NavContextValue | undefined>(undefined);

export function NavigationProvider({ children, initialRoute }: { children: ReactNode; initialRoute?: NavEntry }) {
    const init = initialRoute ? { stack: [initialRoute] } : initial;
    const [state, dispatch] = useReducer(navReducer, init);

    const value: NavContextValue = {
        stack: state.stack,
        current: state.stack[state.stack.length - 1],
        push: (name, params = null) => dispatch({ type: "PUSH", entry: { name, params } }),
        replace: (name, params = null) => dispatch({ type: "REPLACE", entry: { name, params } }),
        back: (steps = 1) => dispatch({ type: "BACK", steps }),
        reset: (entries) => dispatch({ type: "RESET", entries }),
        updateTopState: (patch) => dispatch({ type: "UPDATE_TOP_STATE", statePatch: patch }),
    };

    return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNavigation(): NavContextValue {
    const ctx = useContext(NavContext);
    if (!ctx) throw new Error("useNavigation must be used inside NavigationProvider");
    return ctx;
}