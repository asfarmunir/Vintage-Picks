
export const createCreditCardInvoice = async (data: any) => {
    const response = await fetch("/api/charge-credit-card", {
        method: "POST",
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        throw new Error("Failed to create credit card invoice");
    }
    return response.json();
}

