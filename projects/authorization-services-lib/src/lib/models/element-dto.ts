import {CreatedElementDto} from "./created-element-dto";

export class ElementDto<ID> extends CreatedElementDto {
  id: ID;
  updatedAt: Date;
  updatedBy: string;

  public static override clone<ID>(from: ElementDto<ID>): ElementDto<ID> {
    const to: ElementDto<ID> = new ElementDto();
    ElementDto.copy(from, to);
    return to;
  }
  public static override copy<ID>(from: ElementDto<ID>, to: ElementDto<ID>): void {
    super.copy(from, to);
    to.id = from.id;
    to.updatedAt = from.updatedAt ? new Date(from.updatedAt) : null;
    to.updatedBy = from.updatedBy;
  }
}
