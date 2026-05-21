import InputError from '@/components/input-error'; // Assuming you have this component
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout'; // Assuming you have an admin layout
import { Head, useForm } from '@inertiajs/react';
import { UploadCloud } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs = [
    { title: 'Admin', href: '/admin/dashboard' }, // Adjust if your admin dashboard route is different
    { title: 'Upload Units', href: '/admin/upload-units' },
];

export default function UploadUnits() {
    const [file, setFile] = useState(null);
    const { post, processing, errors, reset, data, setData } = useForm({
        excel_file: null,
    });

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
        setData('excel_file', selectedFile); // Set the file in form data
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file) {
            post('/admin/units/upload', {
                // This will be your Laravel upload route
                onSuccess: () => {
                    alert('File uploaded successfully!');
                    reset('excel_file'); // Reset the form
                    setFile(null); // Clear the selected file
                },
                onError: (err) => {
                    console.error('Upload error:', err);
                    alert('File upload failed. Please check the console or error messages.');
                },
            });
        } else {
            alert('Please select a file to upload.');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Upload Units" />

            <div className="p-4">
                <h2 className="mb-4 text-xl font-semibold">Upload Community Charge Data</h2>

                <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-lg bg-white p-6 shadow-md">
                    <div>
                        <Label htmlFor="excel_file">Select Excel File (.xlsx)</Label>
                        <Input
                            id="excel_file"
                            type="file"
                            accept=".xlsx" // Restrict to .xlsx files
                            onChange={handleFileChange}
                            className="mt-1"
                        />
                        {errors.excel_file && <InputError message={errors.excel_file} />}
                    </div>

                    {file && <div className="text-sm text-gray-500">Selected file: {file.name}</div>}

                    <Button type="submit" disabled={processing || !file} className="flex items-center gap-2">
                        {processing && (
                            <span className="mr-2 animate-spin">
                                <UploadCloud className="h-4 w-4" />
                            </span>
                        )}
                        Upload File
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
