export default function readFile(file) { // function to read files and return data as text
    return new Promise((resolve, reject) => { // Need to use promises here
        let fileContent = '';
        const reader = new FileReader();
        reader.onload = () => { // Once reader finishes, return data
            resolve(fileContent = reader.result);
        };
        reader.onerror = reject;
        reader.readAsText(file);

    });
}