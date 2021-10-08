## Team

![](https://i.imgur.com/mlJ1kZP.gif)

- Cameron Brill (@c00brill)
- Jay Khatri (@theJayKhatri)
- John Pham (@JohnPhamous)

## About Party Parrot as a Service

Party Parrot as a Service is your one-stop-shop for all your party parrot needs. We provide you with an easy way to generate party parrots for you, your team, your friends, and anyone else (everyone deserves a party parrot).

Parrot seekers can use Party Parrot as Service either through our web app or our API.

After receiving an image from you, our team of hundreds of parrots gets to work:

1. Detect the face in the image
2. Crop the image to only include the face
3. Extract the face from the foreground making the background transparent
4. Creates a party parrot from the face
5. Sends the finished party parrot to their new home

While party parrots wait to get picked up, we store them cozily in Supabase's Storage. We also record all the party parrots created in a Supabase database. The database allows us to keep track of how many party parrots have been created and showcase them on our web app.

## Background

At [Highlight](https://highlight.run), we create party parrots whenever a new team member or customer joins our Slack. We've been doing it manually so the time-to-party-parrot (TTPP) after a person joins was varied.

![](https://i.imgur.com/DQAEsgX.gif)

TTPP is a pretty important metric for our company; it drives many of the core business decisions we make. With Party Parrot as a Service, we'll be able to drive this metric up.

## Next Steps

We'll be building a Slack bot that listens to whenever a new person joins our Slack Workspace. After that person joins, we'll send their profile image to Party Parrot as a Service, upload the party parrot as a Slack emoji, then react to the person's joining message with the party parrot.

## Setup

1. Install `pipenv` with `brew install pipenv`


## Installing Dependencies

```sh
pipenv install
```

## Running

```sh
pipenv shell
pipenv run python main.py
```
