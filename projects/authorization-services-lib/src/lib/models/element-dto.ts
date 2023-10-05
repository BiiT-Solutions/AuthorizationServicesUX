import {CreatedElementDto} from "./created-element-dto";

export class ElementDto extends CreatedElementDto {
  id: number;
  updatedAt: Date;
  updatedBy: string;

  public static override clone(from: ElementDto): ElementDto {
    const to: ElementDto = new ElementDto();
    ElementDto.copy(from, to);
    return to;
  }
  public static override copy(from: ElementDto, to: ElementDto): void {
    super.copy(from, to);
    to.id = from.id;
    to.updatedAt = from.updatedAt ? new Date(from.updatedAt) : null;
    to.updatedBy = from.updatedBy;
  }
}
