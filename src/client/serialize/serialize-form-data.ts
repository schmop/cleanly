export function isFormData(data: unknown): data is FormData {
    return data instanceof FormData;
}

export function formDataToSerializableObject(formData: FormData): Record<string, string> {
    return [...formData]
        .reduce((acc: Record<string, string>, [key, value]) => {
            // Remove files, because they cannot be serialized
            if (typeof value === 'string') {
                acc[key] = value;
            }

            return acc;
        }, {} as Record<string, string>);
}

export function objectToFormData(data: Record<string, string>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
    });

    return formData;
}
