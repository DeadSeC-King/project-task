import discord
from discord.ext import commands
import os
import random
import asyncio
print("Bot is starting...")

# ---------------- BOT SETUP ----------------
intents = discord.Intents.all()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f" Logged in as {bot.user}")


# ---------------- ANNOUNCE ----------------
@bot.command()
@commands.has_any_role("╭───𒌋𒀖 「🜲・ THE FOOL」", "╭───𒌋𒀖 「🜲・THE L O R D 」")
async def an(ctx, channel: discord.TextChannel, *, message: str):
    embed = discord.Embed(description=message, color=discord.Color.orange())
    await channel.send(embed=embed)

@an.error
async def an_error(ctx, error):
    if isinstance(error, commands.MissingAnyRole):
        await ctx.send("❌ You do not have the required role to use this command.")


# ---------------- MENTION REPLIES ----------------
@bot.event
async def on_message(message: discord.Message):
    #print(f"[DEBUG] on_message fired: {message.content}")
    if message.author.bot:
        return

    if bot.user.mentioned_in(message):
        msg = message.content.lower()
        response = None

        if "hi" in msg or "hello" in msg:
            response = f"Hello {message.author.mention}!"
        elif "namaste" in msg or "hey" in msg:
            response = f"Namastey {message.author.mention}!"
        elif "tag" in msg:
            response = "𖹭.ᐟ"
        elif "help" in msg:
            response = (
                "> @me tag - to get server member tag\n"
                "> !d num = delete messages num\n"
                "> !lock / !unlock = lock/unlock channel\n"
                "> !bestow / !convict = add/remove role\n"
                "> !ban / !kick / !mute / !unmute\n"
                "> !create_reactionrole\n"
                "> !chat message = talk with AI"
            )

        if response:
            await message.channel.send(response)

    await bot.process_commands(message)


# ---------------- MODERATION ----------------
@bot.command()
@commands.has_permissions(manage_messages=True)
async def d(ctx, amount: int):
    #print(f"[DEBUG] d command executed by {ctx.author}")
    if amount < 1:
        return await ctx.send("⚠ Please provide a number greater than 0.")

    deleted = await ctx.channel.purge(limit=amount+1)
    await ctx.send(f"🗑 Deleted {len(deleted)-1} messages.", delete_after=5)


@bot.command()
@commands.has_permissions(manage_channels=True)
async def lock(ctx):
    overwrite = ctx.channel.overwrites_for(ctx.guild.default_role)
    overwrite.send_messages = False
    await ctx.channel.set_permissions(ctx.guild.default_role, overwrite=overwrite)
    await ctx.send(f"🔒 {ctx.channel.mention} locked.")


@bot.command()
@commands.has_permissions(manage_channels=True)
async def unlock(ctx):
    overwrite = ctx.channel.overwrites_for(ctx.guild.default_role)
    overwrite.send_messages = True
    await ctx.channel.set_permissions(ctx.guild.default_role, overwrite=overwrite)
    await ctx.send(f"🔓 {ctx.channel.mention} unlocked.")


def find_role(guild, role_arg):
    role = None
    if role_arg.isdigit():
        role = guild.get_role(int(role_arg))
    if role is None and role_arg.startswith("<@&") and role_arg.endswith(">"):
        role_id = int(role_arg[3:-1])
        role = guild.get_role(role_id)
    if role is None:
        role = discord.utils.get(guild.roles, name=role_arg)
    return role


@bot.command()
@commands.has_permissions(manage_roles=True)
async def bestow(ctx, member: discord.Member, *, role_arg: str):
    role = find_role(ctx.guild, role_arg)
    if role is None:
        return await ctx.send(f"⚠ Role `{role_arg}` not found.")
    try:
        await member.add_roles(role)
        await ctx.send(f"✅ Added role **{role.name}** to {member.mention}")
    except discord.Forbidden:
        await ctx.send("❌ No permission to add that role.")


@bot.command()
@commands.has_permissions(manage_roles=True)
async def convict(ctx, member: discord.Member, *, role_arg: str):
    role = find_role(ctx.guild, role_arg)
    if role is None:
        return await ctx.send(f"⚠ Role `{role_arg}` not found.")
    try:
        await member.remove_roles(role)
        await ctx.send(f"✅ Removed role **{role.name}** from {member.mention}")
    except discord.Forbidden:
        await ctx.send("❌ No permission to remove that role.")


@bot.command()
@commands.has_any_role("╭───𒌋𒀖 「🜲・ THE FOOL」", "╭───𒌋𒀖 「🜲・THE L O R D 」")
async def ban(ctx, member: discord.Member, *, reason="No reason"):
    try:
        await member.ban(reason=reason)
        await ctx.send(f"🚫 {member.mention} was banned. Reason: {reason}")
    except Exception as e:
        await ctx.send(f"⚠ Error: {e}")


@bot.command()
@commands.has_any_role("╭───𒌋𒀖 「🜲・ THE FOOL」", "╭───𒌋𒀖 「🜲・THE L O R D 」")
async def kick(ctx, member: discord.Member, *, reason="No reason"):
    try:
        await member.kick(reason=reason)
        await ctx.send(f"👢 {member.mention} was kicked. Reason: {reason}")
    except Exception as e:
        await ctx.send(f"⚠ Error: {e}")


@bot.command()
@commands.has_any_role("╭───𒌋𒀖 「🜲・ THE FOOL」", "╭───𒌋𒀖 「🜲・THE L O R D 」")
async def mute(ctx, member: discord.Member, *, reason="No reason"):
    muted_role = discord.utils.get(ctx.guild.roles, name="Muted")
    if not muted_role:
        muted_role = await ctx.guild.create_role(name="Muted")
        for channel in ctx.guild.channels:
            await channel.set_permissions(muted_role, send_messages=False, speak=False)
    await member.add_roles(muted_role, reason=reason)
    await ctx.send(f"🔇 {member.mention} muted. Reason: {reason}")


@bot.command()
@commands.has_any_role("╭───𒌋𒀖 「🜲・ THE FOOL」", "╭───𒌋𒀖 「🜲・THE L O R D 」")
async def unmute(ctx, member: discord.Member):
    muted_role = discord.utils.get(ctx.guild.roles, name="Muted")
    if muted_role in member.roles:
        await member.remove_roles(muted_role)
        await ctx.send(f"🔊 {member.mention} unmuted.")
    else:
        await ctx.send("⚠ This user is not muted.")


# ---------------- WELCOME ----------------
@bot.event
async def on_member_join(member):
    channel = bot.get_channel(1418090278740295813)  # replace with your channel ID
    if channel:
        await channel.send(f"👋 Welcome {member.mention} to **Chakravyuh**! ⚔️")


# ---------------- REACTION ROLES ----------------
@bot.command()
@commands.has_any_role("╭───𒌋𒀖 「🜲・ THE FOOL」", "╭───𒌋𒀖 「🜲・THE L O R D 」")
async def create_reactionrole(ctx):
    def check(m): return m.author == ctx.author and m.channel == ctx.channel

    await ctx.send("📝 Enter a **title/header** for the Reaction Role message:")
    header = (await bot.wait_for("message", check=check)).content

    await ctx.send("📝 Enter a **description**:")
    description = (await bot.wait_for("message", check=check)).content

    reaction_roles = {}
    await ctx.send("🔑 Enter `emoji @Role` pairs (one per line). Type `done` when finished.")
    while True:
        msg = await bot.wait_for("message", check=check)
        if msg.content.lower() == "done":
            break
        try:
            emoji, role_mention = msg.content.split()
            role_id = int(role_mention.strip("<@&>"))
            reaction_roles[emoji] = role_id
        except Exception:
            await ctx.send("⚠ Wrong format! Use `emoji @Role`")

    await ctx.send("📢 Mention the channel to post Reaction Roles:")
    channel_id = int((await bot.wait_for("message", check=check)).content.strip("<#>"))
    channel = bot.get_channel(channel_id)

    embed = discord.Embed(title=header, description=description, color=discord.Color.gold())
    message = await channel.send(embed=embed)

    for emoji in reaction_roles:
        await message.add_reaction(emoji)

    bot.reaction_roles = {str(message.id): reaction_roles}
    await ctx.send("✅ Reaction Role menu created!")


@bot.event
async def on_raw_reaction_add(payload):
    if hasattr(bot, "reaction_roles") and str(payload.message_id) in bot.reaction_roles:
        emoji_map = bot.reaction_roles[str(payload.message_id)]
        if str(payload.emoji) in emoji_map:
            guild = bot.get_guild(payload.guild_id)
            role = guild.get_role(emoji_map[str(payload.emoji)])
            member = guild.get_member(payload.user_id)
            if role and member:
                await member.add_roles(role)


@bot.event
async def on_raw_reaction_remove(payload):
    if hasattr(bot, "reaction_roles") and str(payload.message_id) in bot.reaction_roles:
        emoji_map = bot.reaction_roles[str(payload.message_id)]
        if str(payload.emoji) in emoji_map:
            guild = bot.get_guild(payload.guild_id)
            role = guild.get_role(emoji_map[str(payload.emoji)])
            member = guild.get_member(payload.user_id)
            if role and member:
                await member.remove_roles(role)


# ---------------- TICKETS ----------------
ADMIN_ROLE_ID = 1418090155616501790
TICKET_CATEGORY = "❍──────LOGS───➤"

class TicketButton(discord.ui.View):
    def __init__(self):
        super().__init__(timeout=None)

    @discord.ui.button(label="Open Ticket", style=discord.ButtonStyle.green, custom_id="open_ticket")
    async def open_ticket(self, interaction: discord.Interaction, button: discord.ui.Button):
        guild = interaction.guild
        author = interaction.user

        category = discord.utils.get(guild.categories, name=TICKET_CATEGORY)
        if category is None:
            category = await guild.create_category(TICKET_CATEGORY)

        existing = discord.utils.get(category.channels, name=f"ticket-{author.name}")
        if existing:
            return await interaction.response.send_message(f"❌ You already have a ticket: {existing.mention}", ephemeral=True)

        overwrites = {
            guild.default_role: discord.PermissionOverwrite(read_messages=False),
            author: discord.PermissionOverwrite(read_messages=True, send_messages=True),
            discord.Object(id=ADMIN_ROLE_ID): discord.PermissionOverwrite(read_messages=True, send_messages=True)
        }

        channel = await guild.create_text_channel(
            name=f"ticket-{author.name}",
            category=category,
            overwrites=overwrites
        )

        await channel.send(f"🎫 Hi {author.mention}, please describe your project request here!")
        await interaction.response.send_message(f"✅ Your ticket has been created: {channel.mention}", ephemeral=True)


@bot.command()
async def setup_ticket(ctx):
    view = TicketButton()
    await ctx.send("💻 Click the button below to open a project ticket!", view=view)


@bot.command()
async def close(ctx):
    if ctx.channel.category and ctx.channel.category.name == TICKET_CATEGORY:
        await ctx.channel.delete()
    else:
        await ctx.send("❌ This command can only be used inside a ticket channel.")


# ---------------- GIVEAWAYS ----------------
giveaways = {}  # {message_id: {"prize": str, "entrants": set(), "ended": bool, "message": msg}}

class GiveawayButton(discord.ui.View):
    def __init__(self, message_id):
        super().__init__(timeout=None)
        self.message_id = message_id

    @discord.ui.button(label="🎉 Join Giveaway", style=discord.ButtonStyle.green, custom_id="join_giveaway")
    async def join_giveaway(self, interaction: discord.Interaction, button: discord.ui.Button):
        data = giveaways.get(self.message_id)
        if not data:
            return await interaction.response.send_message("❌ Giveaway not found.", ephemeral=True)

        if data["ended"]:
            return await interaction.response.send_message("⚠️ Giveaway has already ended.", ephemeral=True)

        if interaction.user.id in data["entrants"]:
            return await interaction.response.send_message("⚠️ You already joined!", ephemeral=True)

        data["entrants"].add(interaction.user.id)
        await interaction.response.send_message(f"🎉 {interaction.user.mention} joined the giveaway!", ephemeral=True)


@bot.command()
@commands.has_permissions(manage_messages=True)
async def giveaway(ctx, channel: discord.TextChannel, duration: int, *, prize: str):
    """
    Start a giveaway.
    Usage: !giveaway #channel 60 Free Nitro
    (duration in seconds)
    """
    embed = discord.Embed(
        title="🎉 Giveaway! 🎉",
        description=f"**Prize:** {prize}\n⏰ Duration: {duration} seconds\nClick the button below to join!",
        color=discord.Color.purple()
    )

    msg = await channel.send(embed=embed)
    view = GiveawayButton(message_id=msg.id)
    await msg.edit(view=view)

    giveaways[msg.id] = {"prize": prize, "entrants": set(), "message": msg, "ended": False}

    await ctx.send(f"✅ Giveaway started in {channel.mention} for **{prize}**! Duration: {duration} seconds.")

    await asyncio.sleep(duration)
    await end_giveaway(ctx.guild, msg.id)


async def end_giveaway(guild, message_id):
    data = giveaways.get(message_id)
    if not data or data["ended"]:
        return

    data["ended"] = True
    prize = data["prize"]
    entrants = data["entrants"]

    if not entrants:
        return await data["message"].channel.send(f"❌ No entries for **{prize}**. Giveaway cancelled.")

    winner_id = random.choice(list(entrants))
    winner = guild.get_member(winner_id)
    await data["message"].channel.send(f"🎉 Congratulations {winner.mention}! You won **{prize}** 🎁")

bot.run("MTQxODYyMDA2OTA5Njk4MDY1MQ.GB6sdn.1tRvNMuMrUdKcy9csZnWwJ0Lrf1-KlMCdXK6qo")

