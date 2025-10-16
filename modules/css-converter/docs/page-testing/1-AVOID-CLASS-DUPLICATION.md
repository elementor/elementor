When we import global classes, we need to deal with duplicates. My suggestion: 

If a class exists already, check if the styling is identical. If so, use the existing class name.

If the styling differs, create a different class name with the suffix '-' and integer.

E.g. .first-class exists already and has identical styling, then create a new class name .first-class-1. If -1 exists, continue the process. The next integer is 2.

