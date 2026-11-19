import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res: Response) => res.json());

function useTransactionCategories() {
    const { data, error, isLoading } = useSWR(`${import.meta.env.VITE_API_ROOT_URL}/transcat/all`, fetcher);

    return {
        categories: data,
        isLoading,
        isError: error
    }
}

export default useTransactionCategories;
