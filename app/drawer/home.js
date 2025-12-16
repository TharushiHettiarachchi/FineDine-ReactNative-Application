import { Text, View, StyleSheet, ScrollView, FlatList, Image } from 'react-native';
import { useEffect, useState } from "react";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import ButtonGroups from '../../components/ButtonGroup';
import SearchBarGroups from '../../components/SearchBarGroups';
import { useRouter } from 'expo-router';
import useTrayListener from '../../hooks/useTrayListener';


export default function Home() {
  const [allFoods, setAllFoods] = useState([]); // full list
  const [groupedFoods, setGroupedFoods] = useState({}); // filtered & grouped
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  // ✅ Use tray listener in background (no UI display)
  useTrayListener();

  useEffect(() => {
    const fetchFoods = async () => {
      const foodSnapshot = await getDocs(collection(db, 'foods'));
      const foodList = [];

      foodSnapshot.forEach(doc => {
        foodList.push({ id: doc.id, ...doc.data() });
      });

      setAllFoods(foodList);
      groupFoods(foodList);
    };

    fetchFoods();
  }, []);

  // Group foods by category
  const groupFoods = (foodList) => {
    const grouped = foodList.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
    setGroupedFoods(grouped);
  };

  // Handle search input
  const handleSearch = (text) => {
    setSearchText(text);

    if (text.trim() === '') {
      groupFoods(allFoods);
    } else {
      const filtered = allFoods.filter(item =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      groupFoods(filtered);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Search Bar */}
        <SearchBarGroups
          functionToDo={handleSearch}
          inputValue={searchText}
          mode="text"
          securityType={false}
          editStatus={true}
        />

        {/* Products by category */}
        {Object.keys(groupedFoods).map((category) => (
          <View key={category} style={styles.categoryBlock}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.horizontalLine} />

            <FlatList
              data={groupedFoods[category]}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.imageWrapper}>
                    <Image source={{ uri: item.imageUrl }} style={styles.foodImage} />
                    {(item.isVegetarian || item["is vegetarian"]) && (
                      <View style={styles.vegLabel}>
                        <Text style={styles.vegText}>VEG</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.price}>Full Portion: Rs. {item.fullPortionPrice}</Text>
                  <Text style={styles.price}>Half Portion: Rs. {item.halfPortionPrice}</Text>

                  <ButtonGroups
                    Label={"View"}
                    functionToDo={() =>
                      router.push({
                        pathname: "/home/singleProductView",
                        params: {
                          product: JSON.stringify(item),
                          category: item.category || 'Other',
                        },
                      })
                    }
                  />
                </View>
              )}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffff',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  categoryBlock: {
    width: '100%',
    marginTop: 24,
    paddingLeft: 16,
    paddingBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  card: {
    marginRight: 16,
    width: 200,
    height: 340,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 0,
    padding: 10,
    borderStyle: "solid",
    borderWidth: 1,
    alignItems: "center",
  },
  imageWrapper: {
    width: '100%',
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  vegLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#2E7D32',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 5,
  },
  vegText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  foodName: {
    fontWeight: '600',
    fontSize: 16,
    marginTop: 5,
    marginBottom: 10,
  },
  price: {
    color: '#000000',
    fontSize: 13,
    marginLeft: 5,
    marginTop: 5,
    marginBottom: 5,
  },
  horizontalLine: {
    height: 1,
    width: '90%',
    backgroundColor: '#ccc',
    marginVertical: 10,
  },
});
