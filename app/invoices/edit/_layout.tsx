import { Stack } from "expo-router";

export default function InvoiceEditLayout() {
    return (
        <>
            <Stack screenOptions={{
                headerShown: true,
                animation: "slide_from_right",
                presentation: "transparentModal",
                animationDuration: 200,
                gestureEnabled: true,
                gestureDirection: "horizontal",
                headerTitle: "Invoice Edit",
                headerStyle: {
                    backgroundColor: '#00B2E7',
                },
                headerTitleStyle: {
                    fontWeight: '600',
                    color: 'white',
                },
            }}>
            </Stack>
        </>)
}