# pr-review config

| Key | Default |
|---|---|
| model | `claude-sonnet-5-5-low` |
| effort | `low` |
| escalate model | `claude-opus-5-thinking-high` |
| debate max rounds | 2 |
| max fix options per finding | 2 |

Effort maps onto the slug suffix (`-low`, `-medium`, `-high`, `-xhigh`/`-max`) for the chosen family. If a family has no such variant, say so and ask; do not guess.

Precedence: per-lens override (`security=opus-5:high`) > invocation `model=`/`effort=` > defaults here. Only one level needs to be given; a missing half falls back to the next level.
