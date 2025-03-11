import { ComponentType } from 'react';

declare module './object-clump' {
    export function someFunction(param: number): void;
    export const someConstant: string;
    export const App: ComponentType;
}