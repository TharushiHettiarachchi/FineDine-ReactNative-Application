import { StyleSheet, View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

export default function SearcgBarGroups({ mode, securityType, functionToDo, inputValue, editStatus }) {
    return (
        <View style={styles.inputGroup}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.inputField}
                    inputMode={mode}
                    secureTextEntry={securityType}
                    onChangeText={functionToDo}
                    value={inputValue}
                    editable={editStatus}
                    placeholder="Search..."
                />
                <Ionicons name="search" size={24} color="#000" style={styles.searchIcon} />
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    inputGroup: {
        width: "86%",
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#000000",
        borderWidth: 1,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 0,
        height: 40,
        paddingHorizontal: 10,
    },
    inputField: {
        flex: 1,
        fontSize: 16,
        paddingStart: 10,
        textAlign: "center",
    },
    searchIcon: {
        marginLeft: 10,
    },
});
