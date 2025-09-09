+++
title = "Scalpel - a surgical rotation assistant"
date = 2025-02-01
description = "Scalpel helps med students prepare for their surgical rotations by providing them with comprehensive information about any surgical procedure."

slug = "scalpel"

[taxonomies]
tags = ["project", "llm", "scalpel", "medicine"]

[extra]
comments = true
+++

This year, I started my clinical placements. As many medical students will know, the independence and lack of hand-holding is something that can take a moment to get used to.

One of the most significant challenges I faced this year was during my surgical rotation. In my hospital, students do not have access to the operating theatre schedules, and the only way to see which surgeries are scheduled is to visit the theatre and consult a paper list. This means that I often only found out which surgery was taking place minutes before scrubbing in, leaving me wholly unprepared for any questions I might be asked.

Furthermore, the operating theatre list often has abbrevations or acronyms that are not always clear. For example, take the procedure `ORIF distal rad +/- K-wire`. To be as prepared as possible, it would be useful to know: what is an ORIF? What is a K-wire? When do we decide whether to use a K-wire? Even if I found the answers to these questions on Google, I might still be lacking information on general questions like: what are the steps for this procedure? What's the relevant anatomy?

Therefore, I decided to create a small webapp that
  `1
