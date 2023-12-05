import { environment } from '@/environments/environment';

const baseUrl: string = environment.apiUrl;
var headers: Record<string, string> = {};

/**
 * Make a JSON get request
 * @param url Request endpoint
 */
export const getRequest = async <TResponse>(url: string, token: string | null): Promise<TResponse> => {
    if (token) {
        headers = {
            Authorization: token,
        };
    }
    const response = await fetch(baseUrl + url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });

    // if (!response.ok) {
    //     return Promise.reject(response.statusText);
    // }
    const res = (await response.json()) as TResponse;
    return res;
};

/**
 * Make a JSON post request
 * @param url Request endpoint
 * @param body JSON serializable request body
 */
export const postRequest = async <TResponse>(url: string, body: any, token?: string | null): Promise<TResponse> => {
    if (token) {
        headers = {
            Authorization: token,
        };
    }
    const response = await fetch(baseUrl + url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(body),
    });
    return (await response.json()) as TResponse;
};

/**
 * Make a JSON put request
 * @param url Request endpoint
 * @param body JSON serializable request body
 */
export const putRequest = async <TResponse>(url: string, body: any, token: string | null): Promise<TResponse> => {
    if (token) {
        headers = {
            Authorization: token,
        };
    }
    const response = await fetch(baseUrl + url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        return Promise.reject(response.statusText);
    }

    return (await response.json()) as TResponse;
};

/**
 * Make a JSON delete request
 * @param url Request endpoint
 */
export const deleteRequest = async <TResponse>(url: string, token: string | null): Promise<TResponse> => {
    if (token) {
        headers = {
            Authorization: token,
        };
    }
    const response = await fetch(baseUrl + url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });

    if (!response.ok) {
        return Promise.reject(response.statusText);
    }

    return (await response.json()) as TResponse;
};
