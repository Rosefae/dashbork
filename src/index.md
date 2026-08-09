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
screenshotbtn.addEventListener("click", async (e) => {
    const dashboard = "test_board",
        width = 528,
        height = 792;
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