

test('a game Owner after deploying classes has classesLocations', async () => {
    const {GameServer} = await import("./gameServer.js");

    const gameOwner = new GameServer();
    await gameOwner.deployClasses();

    expect(gameOwner.classesLocations.game).not.toBe('native://Jig');
    expect(gameOwner.classesLocations.player).not.toBe('native://Jig');
    expect(typeof gameOwner.classesLocations.game).toBe("string");
    expect(typeof gameOwner.classesLocations.player).toBe("string");
});