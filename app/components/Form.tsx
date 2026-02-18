import React from 'react'
import GlassInput from './GlassInput'
import GlassButton from './GlassButton'

interface FormProps {
    url: string;
    setUrl: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

function Form({ url, setUrl, isLoading, handleSubmit }: FormProps) {
    return (
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row w-full max-w-xl items-center gap-3">
            <GlassInput
                value={url}
                onChange={setUrl}
                disabled={isLoading}
            />
            <GlassButton type="submit" disabled={isLoading || !url.trim()}>
                {isLoading ? "Summarizing..." : "Summarize"}
            </GlassButton>
        </form>
    )
}

export default Form
