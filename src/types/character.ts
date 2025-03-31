export interface CharacterPartsType {
    character?: {
        id: number;
        userId: number;
        parts: JsonValue;
        createdAt: Date;
        updatedAt: Date;
    } | null; // nullも許容
}