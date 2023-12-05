export interface IResult<T> {
    errors: string[];
    value: T;
    isSuccess: boolean;
}
