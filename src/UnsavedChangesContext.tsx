import { createContext, useContext, useState, type ReactNode, useCallback } from 'react';

interface UnsavedChangesContextType {
    hasUnsavedChanges: boolean;
    setHasUnsavedChanges: (value: boolean) => void;
    checkNavigation: () => boolean; // Returns true if navigation should proceed
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const checkNavigation = useCallback(() => {
        if (hasUnsavedChanges) {
            return window.confirm('未保存の変更があります。このページを離れますか？');
        }
        return true;
    }, [hasUnsavedChanges]);

    return (
        <UnsavedChangesContext.Provider value={{ hasUnsavedChanges, setHasUnsavedChanges, checkNavigation }}>
            {children}
        </UnsavedChangesContext.Provider>
    );
}

export function useUnsavedChanges() {
    const context = useContext(UnsavedChangesContext);
    if (!context) {
        throw new Error('useUnsavedChanges must be used within an UnsavedChangesProvider');
    }
    return context;
}
