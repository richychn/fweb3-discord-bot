export interface payload {
    message: string;
}
export declare type request = string | payload;
export interface response {
    success: boolean;
    response?: unknown;
    reason?: string;
}
declare const send: (webhook: string, request: request) => Promise<response>;
declare const ping: (webhook: string) => Promise<response>;
export { send, ping };
