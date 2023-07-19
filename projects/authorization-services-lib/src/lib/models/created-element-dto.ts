export class CreatedElementDto {
  createdAt: Date;
  createdBy: string;

  public static clone(from: CreatedElementDto): CreatedElementDto {
    const to: CreatedElementDto = new CreatedElementDto();
    CreatedElementDto.copy(from, to);
    return to;
  }
  public static copy(from: CreatedElementDto, to: CreatedElementDto): void {
    to.createdAt = from.createdAt ? new Date(from.createdAt) : null;
    to.createdBy = from.createdBy;
  }}
