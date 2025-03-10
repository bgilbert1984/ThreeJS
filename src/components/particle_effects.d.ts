declare module './particle_effects' {
    export function createParticleEffect(options: {
        position: { x: number; y: number; z: number };
        velocity: { x: number; y: number; z: number };
        lifetime: number;
        color: string;
    }): void;

    export function updateParticleEffects(deltaTime: number): void;

    export function renderParticleEffects(): void;
}