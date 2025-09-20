import discord
from discord.ext import commands

# Setup bot
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")

# Command: !announce Your custom text here
# annoucment ka code h nichey
from discord.ext import commands
import discord

bot = commands.Bot(command_prefix="!", intents=discord.Intents.all())

@bot.command()
@commands.has_any_role("╭───𒌋𒀖 「🜲・ THE FOOL」", "╭───𒌋𒀖 「🜲・THE L O R D 」")
async def an(ctx, channel: discord.TextChannel, *, message: str):
    embed = discord.Embed(description=message, color=discord.Color.orange())
    await channel.send(embed=embed)

# Optional: Handle permission errors
@an.error
async def an_error(ctx, error):
    if isinstance(error, commands.MissingAnyRole):
        await ctx.send("You do not have the required role to use this command ❌")


@bot.event
async def on_message(message):
    # Ignore messages from the bot itself
    if message.author == bot.user:
        return

    # Check if the bot is mentioned
    if bot.user in message.mentions:
        msg = str(message.content).lower()
        # add replying messages
        if "hi" in msg or "hello" in msg:
            await message.channel.send(f"Hello {message.author.mention}!")
        elif "namaste" in msg or "hey" in msg:
            await message.channel.send(f"Namastey! {message.author.mention}!")
        elif "tag" in msg :
            await message.channel.send(f"    𖹭.ᐟ   ")
        elif "help" in msg :
            await message.channel.send(f''' > @me tag - to get server member tag 
                                            > !d num = delete messages num 
                                            > !lock = locks a channel 
                                            > !unlock = unlocks a channel 
                                            > !bestow = adds role
                                            > !convict = removes role
                                            > !ban = bans user
                                            > !kick = kicks user
                                              ''')


    # Process other commands if you have any
    await bot.process_commands(message)


# Command: delete messages
@bot.command()
@commands.has_permissions(manage_messages=True)  # only mods/admins with permission
async def d(ctx, amount: int):
    if amount < 1:
        await ctx.send("⚠ Please provide a number greater than 0.")
        return
    deleted = await ctx.channel.purge(limit=amount+1)  # +1 to also delete the command message itself
    await ctx.send(f" Deleted {len(deleted)-1} messages.", delete_after=5)


#  Lock channel
@bot.command()
@commands.has_permissions(manage_channels=True)
async def lock(ctx):
    overwrite = ctx.channel.overwrites_for(ctx.guild.default_role)
    overwrite.send_messages = False
    await ctx.channel.set_permissions(ctx.guild.default_role, overwrite=overwrite)
    await ctx.send(f">  {ctx.channel.mention} has been **locked**.")

#  Unlock channel
@bot.command()
@commands.has_permissions(manage_channels=True)
async def unlock(ctx):
    overwrite = ctx.channel.overwrites_for(ctx.guild.default_role)
    overwrite.send_messages = True
    await ctx.channel.set_permissions(ctx.guild.default_role, overwrite=overwrite)
    await ctx.send(f">  {ctx.channel.mention} has been **unlocked**.")


def find_role(guild, role_arg):
    # First try by mention/ID
    role = None
    if role_arg.isdigit():
        role = guild.get_role(int(role_arg))
    if role is None and role_arg.startswith("<@&") and role_arg.endswith(">"):
        role_id = int(role_arg[3:-1])
        role = guild.get_role(role_id)
    # If still not found, try by name
    if role is None:
        role = discord.utils.get(guild.roles, name=role_arg)
    return role

#  Add role
@bot.command()
@commands.has_permissions(manage_roles=True)
async def bestow(ctx, member: discord.Member, *, role_arg: str):
    role = find_role(ctx.guild, role_arg)
    if role is None:
        await ctx.send(f"⚠ Role `{role_arg}` not found.")
        return
    try:
        await member.add_roles(role)
        await ctx.send(f" Added role **{role.name}** to {member.mention}")
    except discord.Forbidden:
        await ctx.send(" I don’t have permission to add that role.")

#  Remove role
@bot.command()
@commands.has_permissions(manage_roles=True)
async def convict(ctx, member: discord.Member, *, role_arg: str):
    role = find_role(ctx.guild, role_arg)
    if role is None:
        await ctx.send(f"⚠ Role `{role_arg}` not found.")
        return
    try:
        await member.remove_roles(role)
        await ctx.send(f" Removed role **{role.name}** from {member.mention}")
    except discord.Forbidden:
        await ctx.send(" I don’t have permission to remove that role.")

@bot.command()
@commands.has_any_role("╭───𒌋𒀖 「🜲・ THE FOOL」", "╭───𒌋𒀖 「🜲・THE L O R D 」")
async def ban(ctx, member: discord.Member, *, reason="No reason"):
    try:
        await member.ban(reason=reason)
        await ctx.send(f" {member.mention} was banned. Reason: {reason}")
    except discord.Forbidden:
        await ctx.send(" I don’t have permission to ban this user.")
    except Exception as e:
        await ctx.send(f" Error: {str(e)}")
#kick cmd
@bot.command()
@commands.has_any_role("╭───𒌋𒀖 「🜲・ THE FOOL」", "╭───𒌋𒀖 「🜲・THE L O R D 」")
async def kick(ctx, member: discord.Member, *, reason: str = "No reason"):
    try:
        await member.kick(reason=reason)
        await ctx.send(f" {member.mention} was kicked. Reason: {reason}")
    except discord.Forbidden:
        await ctx.send(" I don’t have permission to kick this user.")
    except Exception as e:
        await ctx.send(f" Error: {str(e)}")

bot.run("MTQxODYyMDA2OTA5Njk4MDY1MQ.GB6sdn.1tRvNMuMrUdKcy9csZnWwJ0Lrf1-KlMCdXK6qo")
