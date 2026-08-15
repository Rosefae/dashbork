---
eleventyExcludeFromCollections: true
---

# Dashbork

## List of all dashboards

{% for board in collections.all %}

- [{{board.data.title}}]({{board.url}})

{% endfor %}