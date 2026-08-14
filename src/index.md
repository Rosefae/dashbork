---
eleventyExcludeFromCollections: true
---

# Dashbork

## List of all dashboards

{% for board in collections.all %}

- [{{board.data.title}}]({{board.url}})

{% endfor %}

## Utils for testing

<button type="button" id="screenshot">
Screenshot and send url to console
</button>

<script>
const screenshotbtn = document.getElementById("screenshot");

const testDimensions = [
    [528, 792], // x3
    [800, 480]  // Seeed Studio ReTerminal E1002
];
screenshotbtn.addEventListener("click", async (e) => {
    const dashboard = "entryway",
        testDimension = testDimensions[1];

    const width = testDimension[0],
        height = testDimension[1];

    console.log(`Testing with ${dashboard} at ${width}x${height}`);

    const queryString = new URLSearchParams({
        dashboard: dashboard,
        width: width,
        height: height
    }).toString();

    try {
        const response = await fetch(`/api/display?${queryString}`);
        if (!response.ok) {
            throw new Error(`:( ${response.status}`);
        }

        const data = await response.json();

        console.log(data);

    } catch (error) {
        console.error(error);
    }
});
</script>